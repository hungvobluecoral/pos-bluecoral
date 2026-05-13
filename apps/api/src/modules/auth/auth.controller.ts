import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { BranchScopeClaims, TenantScopeClaims } from '@pos-bluecoral/contracts';
import { successResponse } from '../../common/http/api-response';
import { AuthService } from './auth.service';
import { LoginRequestDto, normalizeLoginRequest, validateLoginRequest } from './dto/login.dto';
import { SelectBranchRequestDto, validateSelectBranchRequest } from './dto/select-branch.dto';
import { EnterBranchRequestDto, validateEnterBranchRequest } from './dto/enter-branch.dto';
import { SetupPasswordRequestDto, validateSetupPasswordRequest } from './dto/setup-password.dto';

const REFRESH_COOKIE = 'refresh_token';
const SESSION_COOKIE = 'session_id';
const COOKIE_PATH = '/api/auth';

type ScopedRequest = Request & { requestId?: string };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập — trả về JWT trực tiếp hoặc yêu cầu chọn branch' })
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({ description: 'authenticated hoặc branch_select_required.' })
  @ApiBadRequestResponse({ description: 'Payload không hợp lệ.' })
  @ApiUnauthorizedResponse({ description: 'Thông tin đăng nhập không đúng hoặc tài khoản không hoạt động.' })
  async login(
    @Body() body: LoginRequestDto,
    @Req() req: ScopedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const normalized = normalizeLoginRequest(body);
    const issues = validateLoginRequest(normalized);
    if (issues.length > 0) {
      throw new BadRequestException({ code: 'validation-failed', message: 'Dữ liệu đăng nhập không hợp lệ.', details: issues });
    }

    const ctx = this.buildCtx(req);
    const { response, rawRefreshToken } = await this.authService.login(normalized, ctx);

    if (response.outcome === 'authenticated' && rawRefreshToken) {
      this.setRefreshCookie(res, rawRefreshToken);
      this.setSessionCookie(res, response.sessionId);
    }

    return successResponse(response, { requestId: req.requestId });
  }

  @Post('select-branch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Chọn branch sau login (multi-branch users) — nhận JWT branch_scope' })
  @ApiBody({ type: SelectBranchRequestDto })
  @ApiOkResponse({ description: 'Branch scope JWT đã được cấp.' })
  @ApiBadRequestResponse({ description: 'Payload không hợp lệ.' })
  @ApiUnauthorizedResponse({ description: 'Session token không hợp lệ hoặc hết hạn.' })
  @ApiForbiddenResponse({ description: 'Branch không tồn tại hoặc không thuộc quyền truy cập.' })
  async selectBranch(
    @Body() body: SelectBranchRequestDto,
    @Req() req: ScopedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const issues = validateSelectBranchRequest(body);
    if (issues.length > 0) {
      throw new BadRequestException({ code: 'validation-failed', message: 'Dữ liệu không hợp lệ.', details: issues });
    }

    const ctx = this.buildCtx(req);
    const { response, rawRefreshToken } = await this.authService.selectBranch(body.sessionToken, body.branchId, ctx);

    this.setRefreshCookie(res, rawRefreshToken);
    this.setSessionCookie(res, response.sessionId);

    return successResponse(response, { requestId: req.requestId });
  }

  @Post('enter-branch')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Owner chuyển sang branch context — nhận access token branch_scope mới (không cấp refresh token mới)' })
  @ApiBody({ type: EnterBranchRequestDto })
  @ApiOkResponse({ description: 'Branch scope access token mới.' })
  @ApiUnauthorizedResponse({ description: 'Token không hợp lệ hoặc không phải tenant_scope JWT.' })
  @ApiForbiddenResponse({ description: 'Branch không thuộc tenant này hoặc không phải Owner.' })
  async enterBranch(
    @Body() body: EnterBranchRequestDto,
    @Req() req: ScopedRequest,
  ) {
    const issues = validateEnterBranchRequest(body);
    if (issues.length > 0) {
      throw new BadRequestException({ code: 'validation-failed', message: 'Dữ liệu không hợp lệ.', details: issues });
    }

    const claims = this.extractAccessTokenClaims(req);
    if (claims.type !== 'tenant_scope') {
      throw new ForbiddenException({ code: 'scope-mismatch', message: 'Chỉ Owner với tenant_scope JWT mới có thể vào branch context.' });
    }

    const response = await this.authService.enterBranch(claims as TenantScopeClaims, body.branchId);
    return successResponse(response, { requestId: req.requestId });
  }

  @Post('exit-branch')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Owner thoát branch context — trả về tenant_scope access token' })
  @ApiOkResponse({ description: 'Tenant scope access token mới.' })
  @ApiUnauthorizedResponse({ description: 'Token không hợp lệ hoặc không phải branch_scope JWT.' })
  @ApiForbiddenResponse({ description: 'Chỉ Owner mới có thể thoát branch context.' })
  async exitBranch(@Req() req: ScopedRequest) {
    const claims = this.extractAccessTokenClaims(req);
    if (claims.type !== 'branch_scope') {
      throw new ForbiddenException({ code: 'scope-mismatch', message: 'Phải đang ở branch_scope để thoát.' });
    }

    const response = await this.authService.exitBranch(claims as BranchScopeClaims);
    return successResponse(response, { requestId: req.requestId });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate refresh token và cấp access JWT mới' })
  @ApiCookieAuth(REFRESH_COOKIE)
  @ApiOkResponse({ description: 'Token làm mới thành công.' })
  @ApiUnauthorizedResponse({ description: 'Refresh token không hợp lệ, hết hạn hoặc đã bị thu hồi.' })
  async refresh(
    @Req() req: ScopedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawRefreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    const sessionId = req.cookies?.[SESSION_COOKIE] as string | undefined;

    if (!rawRefreshToken || !sessionId) {
      throw new UnauthorizedException({ code: 'missing-token', message: 'Refresh token hoặc session không tồn tại.' });
    }

    const ctx = this.buildCtx(req);
    const { response, newRawToken } = await this.authService.refresh(rawRefreshToken, sessionId, ctx);
    this.setRefreshCookie(res, newRawToken);

    return successResponse(response, { requestId: req.requestId });
  }

  @Post('setup-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kích hoạt tài khoản — đặt mật khẩu lần đầu bằng invite token' })
  @ApiBody({ type: SetupPasswordRequestDto })
  @ApiOkResponse({ description: 'Tài khoản đã được kích hoạt. Đăng nhập để tiếp tục.' })
  @ApiBadRequestResponse({ description: 'Token không hợp lệ, đã dùng, hết hạn hoặc mật khẩu quá ngắn.' })
  async setupPassword(@Body() body: SetupPasswordRequestDto, @Req() req: ScopedRequest) {
    const issues = validateSetupPasswordRequest(body);
    if (issues.length > 0) {
      throw new BadRequestException({ code: 'validation-failed', message: 'Dữ liệu không hợp lệ.', details: issues });
    }

    const response = await this.authService.setupPassword(body);
    return successResponse(response, { requestId: req.requestId });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng xuất: thu hồi session refresh tokens' })
  @ApiCookieAuth(SESSION_COOKIE)
  @ApiOkResponse({ description: 'Đăng xuất thành công.' })
  async logout(
    @Req() req: ScopedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = req.cookies?.[SESSION_COOKIE] as string | undefined;
    const authHeader = req.headers['authorization'];
    let actorId = 'unknown';

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const claims = this.authService.verifyAccessToken(authHeader.slice(7));
        actorId = claims.userId;
      } catch {
        // token may be expired, continue logout anyway
      }
    }

    if (sessionId) {
      await this.authService.logout(sessionId, actorId, this.buildCtx(req));
    }

    this.clearRefreshCookies(res);
    return successResponse({ loggedOut: true }, { requestId: req.requestId });
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private buildCtx(req: ScopedRequest) {
    return {
      requestId: req.requestId ?? 'unknown',
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    };
  }

  private extractAccessTokenClaims(req: ScopedRequest) {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException({ code: 'missing-token', message: 'Bearer token bắt buộc.' });
    }
    return this.authService.verifyAccessToken(authHeader.slice(7));
  }

  private setSessionCookie(res: Response, sessionId: string) {
    res.cookie(SESSION_COOKIE, sessionId, {
      httpOnly: false,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private setRefreshCookie(res: Response, rawRefreshToken: string) {
    res.cookie(REFRESH_COOKIE, rawRefreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      path: COOKIE_PATH,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearRefreshCookies(res: Response) {
    res.clearCookie(REFRESH_COOKIE, { path: COOKIE_PATH });
    res.clearCookie(SESSION_COOKIE, { path: '/' });
  }
}
