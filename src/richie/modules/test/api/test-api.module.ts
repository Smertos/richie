import { Module } from '@nestjs/common';
import { TestApiController } from './test-api.controller';

@Module({
  controllers: [TestApiController]
})
export class TestApiModule {}
