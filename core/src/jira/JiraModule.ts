import { Module } from '@nestjs/common';
import { JiraService } from './services/JiraService';


@Module({
  imports: [

  ],
  providers: [JiraService],
  exports: [JiraService]
})
export class JiraModule {}
