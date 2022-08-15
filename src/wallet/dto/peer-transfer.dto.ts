import {
    IsString,
    IsNumber,
    IsNotEmpty,
    IsEmail,
    IsOptional,
    IsPositive,
    Min,
} from 'class-validator';

export class PeerTransferDto {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    user?: any;

    @IsNotEmpty()
    @IsEmail()
    receiver: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Min(100)
    amount: number;

    @IsNotEmpty()
    @IsString()
    transactionPin: string;
}
