import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// JwtService is provided globally by the JwtModule registered in AppModule
// (registerAsync({ global: true, ... })), so it doesn't need to be
// re-registered here — AuthService can inject it directly.

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
