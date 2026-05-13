import { Module } from '@nestjs/common';
import { BranchesRepository } from './repositories/branches.repository';

@Module({
  providers: [BranchesRepository],
  exports: [BranchesRepository],
})
export class BranchesModule {}
