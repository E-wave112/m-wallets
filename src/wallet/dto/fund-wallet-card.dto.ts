import {
    IsString,
    IsNumber,
    IsNotEmpty,
    IsPositive,
    Min,
} from 'class-validator';

export class FundWalletByCardDto {
    @IsNotEmpty()
    @IsString()
    cardExpiration: string;

    @IsNotEmpty()
    @IsString()
    card: string;

    @IsNotEmpty()
    @IsString()
    cardCvv: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Min(100)
    amount: number;

    @IsNotEmpty()
    @IsString()
    pin: string;

    @IsNotEmpty()
    @IsString()
    otp: string;
}
