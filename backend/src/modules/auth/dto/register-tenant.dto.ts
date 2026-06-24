import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class RegisterTenantDto {
  @IsNotEmpty({ message: "organizationName is required" })
  organizationName!: string;

  @IsNotEmpty({ message: "fullName is required" })
  fullName!: string;

  @IsEmail({}, { message: "email must be a valid email" })
  email!: string;

  @MinLength(8, { message: "password must be at least 8 characters" })
  password!: string;
}
