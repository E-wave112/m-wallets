import {
    IsString,
    IsNumber,
    IsNotEmpty,
    IsPositive,
    Min,
} from 'class-validator';

export class WithdrawWalletDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Min(100)
    amount: number;

    @IsNotEmpty()
    @IsString()
    account_bank: string;

    @IsNotEmpty()
    @IsString()
    accountNumber: string;

    @IsNotEmpty()
    @IsString()
    transactionPin: string;
}
