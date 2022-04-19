import { Controller, Get } from '@nestjs/common';

@Controller('api/test')
export class TestApiController {

  @Get('hello-test')
  helloTest(): string {
    return 'hello there :)';
  }
}
