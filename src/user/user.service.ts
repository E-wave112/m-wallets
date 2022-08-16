import { Injectable, HttpStatus } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { LogInUserDto } from './dto/login.dto';
import { ChangePinDto } from './dto/change-pin.dto';
import { User } from './entities/user.entity';
import { Emailver } from './entities/emailver.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
    UserNotFoundException,
    IncorrectCredentialsException,
    TokenExpiredException,
    TransactionPinNotSetException,
    AccountNotVerifiedException,
} from '../exceptions';
import { Compare, hashCred, ResponseStruct } from '../utils';
import { RequestVerifyEmailDto } from './dto/request-verify-email.dto';
import { EmailOption } from '../mail/types/mail.types';
import { mailStructure } from '../mail/interface-send/mail.send';
import { v4 as uuidv4 } from 'uuid';
import { ResetPinDto } from './dto/reset-pin.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestResetPinDto } from './dto/request-reset-pin.dto';
import { TransactionPinDto } from './dto/transaction-pin.dto';
import { PrivateKeyDto } from './dto/private-key.dto';
import { ResetTransactionPinDto } from './dto/reset-transaction-pin.dto';
import { ValidatePinDto } from './dto/validate-pin.dto';
import { ChangeTransactionPinDto } from './dto/change-transaction-pin.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private UserRepository: Repository<User>,
        @InjectRepository(Emailver)
        private EmailverRepository: Repository<Emailver>,
        private readonly user: User,
        private readonly configService: ConfigService,
        private eventEmitter: EventEmitter2,
    ) {}

    async findUser(login: LogInUserDto): Promise<User> {
        try {
            const singleUser = await this.UserRepository.find({
                where: [{ email: login.email }, { phone: login.phone }],
            });

            if (!singleUser.length) {
                throw new UserNotFoundException();
            }
            const comparePin = singleUser[0].pin;

            const validPassword = await Compare(login.pin, comparePin);

            if (!singleUser.length || !validPassword) {
                throw new IncorrectCredentialsException();
            }
            return singleUser[0];
        } catch (err) {
            throw new BadRequestException('incorrect credentials!');
        }
    }

    async findUserById(id: string) {
        try {
            const singleUser = await this.UserRepository.findOne(id);
            if (!singleUser) throw new UserNotFoundException();
            return singleUser;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async findUserByEmail(email: string) {
        try {
            const singleUser = await this.UserRepository.findOne({
                where: { email },
            });
            if (!singleUser) throw new UserNotFoundException();
            return singleUser;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async isVerifiedUser(id: string): Promise<void | User> {
        try {
            const singleUser = await this.findUserById(id);
            if (!singleUser.verified) {
                throw new AccountNotVerifiedException();
            }
            return singleUser;
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async updateUser(id: string, user: Partial<User>): Promise<ResponseStruct> {
        try {
            const singleUser = await this.findUserById(id);
            if (user.pin || user.transactionPin) {
                throw new BadRequestException(
                    'try updating your tokens/pins in their specific endpoints',
                );
            }
            const updatedUser = await this.UserRepository.save({
                id: singleUser.id,
                ...user,
            });

            return {
                statusCode: HttpStatus.OK,
                message: 'user updated successfully',
                data: updatedUser,
            };
        } catch (err: any) {
            throw new BadRequestException(err.message);
        }
    }

    async requestVerifyEmail(
        data: RequestVerifyEmailDto,
    ): Promise<ResponseStruct> {
        const BASE_URL = this.configService.get<'string'>('API_BASE_URL');

        try {
            const checkEmail: Emailver = await this.EmailverRepository.findOne({
                email: data.email,
                valid: true,
            });
            const token = uuidv4().split('-').join('');
            const expiry = Date.now() + 1440 * 60 * 1000;
            // update the emailver row if the phone number already exists else create a new one
            const newEmailVer = checkEmail
                ? await this.EmailverRepository.save({
                      id: checkEmail.id,
                      verifyToken: token,
                      verifyTokenExpiry: expiry,
                      email: data.email,
                      valid: true,
                  })
                : await this.EmailverRepository.save({
                      email: data.email,
                      verifyToken: token,
                      verifyTokenExpiry: expiry,
                  });

            // TODO send mail
            const verifyEmail: EmailOption = mailStructure(
                [data.email],
                'support@moniwallet.io',
                'Verify Your Account',
                this.configService.get('TEMPLATE_VERIFY_ACCOUNT'),
                {
                    firstName: `${data.firstName}`,
                    subject: 'Verify Your Account',
                    verifyLink: `${BASE_URL}/user/verify/${token}/${data.email}`,
                },
            );

            this.eventEmitter.emit('user.verification', verifyEmail);
            return {
                statusCode: HttpStatus.OK,
                message: 'Email verification link sent successfully!',
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async verifyEmail(data: VerifyEmailDto): Promise<ResponseStruct> {
        try {
            const findEmailVerifyToken: Emailver =
                await this.EmailverRepository.findOne({
                    verifyToken: data.token,
                    valid: true,
                    email: data.email,
                });
            if (!findEmailVerifyToken) {
                throw new BadRequestException('invalid token!');
            }
            if (
                findEmailVerifyToken.verifyTokenExpiry < Date.now() ||
                !findEmailVerifyToken.valid
            ) {
                findEmailVerifyToken.valid = false;
                await findEmailVerifyToken.save();
                throw new BadRequestException(
                    'token expired!, please try verifying your email again',
                );
            }
            // delete this particular emailver row instance
            const user = await this.UserRepository.findOne({
                email: data.email,
                verified: false,
            });
            if (!user) {
                throw new UserNotFoundException(
                    'oops, seems this account has already been verified',
                );
            }
            user.verified = true;
            await user.save();
            await findEmailVerifyToken.remove();
            return {
                statusCode: HttpStatus.OK,
                message: 'Email verified successfully!',
            };
        } catch (error) {
            throw new BadRequestException(
                'An error occurred!, it seems the link is invalid or this account has already been verified',
            );
        }
    }

    async updatePin(data: ChangePinDto, id: string): Promise<ResponseStruct> {
        try {
            const user = await this.findUserById(id);
            if (!(await Compare(data.oldPin, user.pin)))
                throw new IncorrectCredentialsException('incorrect pin!');

            if (data.newPin !== data.confirmPin)
                throw new IncorrectCredentialsException('Pin mismatch!');

            user.pin = hashCred(data.newPin);
            await user.save();
            return {
                statusCode: HttpStatus.OK,
                message: 'pin updated successfully',
            };
        } catch (error) {
            throw new IncorrectCredentialsException(error.message);
        }
    }

    async resetPin(data: ResetPinDto): Promise<ResponseStruct> {
        try {
            const findUserToken: User = await this.UserRepository.findOne({
                resetToken: data.token,
            });
            if (!findUserToken || Date.now() > findUserToken.resetTokenExpiry)
                throw new TokenExpiredException(
                    'This token is invalid, please try resetting your password again',
                );
            if (data.pin !== data.confirmPin)
                throw new IncorrectCredentialsException('pin mismatch!');
            findUserToken.pin = hashCred(data.pin);
            findUserToken.resetToken = '';
            findUserToken.resetTokenExpiry = Date.now();
            await findUserToken.save();
            return {
                statusCode: HttpStatus.OK,
                message: 'pin reset successful!',
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async requestResetPin(data: RequestResetPinDto): Promise<ResponseStruct> {
        const BASE_URL = this.configService.get<'string'>('API_BASE_URL');
        try {
            const findUser: User = await this.findUserByEmail(data.email);
            if (!findUser) throw new UserNotFoundException();
            const token = uuidv4().split('-').join('');
            findUser.resetToken = token;
            findUser.resetTokenExpiry = Date.now() + 30 * 60 * 1000;
            await findUser.save();
            // TODO: send email
            const resetPin: EmailOption = mailStructure(
                [data.email],
                'support@moniwallet.io',
                'Reset your Pin',
                this.configService.get('TEMPLATE_RESET_PIN'),
                {
                    firstName: `${findUser.firstName}`,
                    subject: 'Reset Your Pin',
                    resetLink: `${BASE_URL}/user/reset-pin/${token}`,
                },
            );

            this.eventEmitter.emit('user.reset-pin', resetPin);
            return {
                statusCode: HttpStatus.OK,
                message: 'Reset pin link sent successfully!',
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async setTransactionPin(
        id: string,
        data: TransactionPinDto,
    ): Promise<ResponseStruct> {
        try {
            const findUser: User = await this.findUserById(id);
            if (findUser.transactionPin) {
                throw new BadRequestException(
                    'oops, it seems you already have a transaction pin set up, if you want to change your pin, try updating it in the user settings',
                );
            }
            if (data.newPin !== data.confirmPin)
                throw new IncorrectCredentialsException(
                    'transaction pin mismatch!',
                );
            findUser.transactionPin = hashCred(data.newPin);
            await findUser.save();
            return {
                statusCode: HttpStatus.OK,
                message: 'transaction pin set successfully !',
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async validateTransactionPin(
        data: ValidatePinDto,
    ): Promise<ResponseStruct> {
        try {
            const findUser: User = await this.findUserById(data.userId);
            if (!findUser.transactionPin) {
                throw new TransactionPinNotSetException();
            }
            if (!(await Compare(data.pin, findUser.transactionPin))) {
                throw new IncorrectCredentialsException(
                    'incorrect transactionPin!',
                );
            }
            return {
                statusCode: HttpStatus.OK,
                message: 'success!',
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async validatePrivateKey(
        id: string,
        data: PrivateKeyDto,
    ): Promise<ResponseStruct> {
        try {
            const user = await this.findUserById(id);
            if (!(await Compare(data.privateKey, user.privateKey))) {
                throw new IncorrectCredentialsException('incorrect key!');
            }
            return {
                statusCode: HttpStatus.OK,
                message:
                    'key validated successfully, now you can go ahead to reset your transaction pin!',
            };
        } catch (error) {
            throw new IncorrectCredentialsException('incorrect key!');
        }
    }

    async resetTransactionPin(
        id: string,
        data: ResetTransactionPinDto,
    ): Promise<ResponseStruct> {
        try {
            const findUser: User = await this.findUserById(id);
            if (data.transactionPin !== data.confirmPin)
                throw new IncorrectCredentialsException(
                    ' transaction pin mismatch!',
                );
            findUser.transactionPin = hashCred(data.transactionPin);
            await findUser.save();
            return {
                statusCode: HttpStatus.OK,
                message: 'transaction pin reset successfully!',
            };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    async updateTransactionPin(
        data: ChangeTransactionPinDto,
        id: string,
    ): Promise<ResponseStruct> {
        try {
            const user = await this.findUserById(id);
            if (!(await Compare(data.oldPin, user.transactionPin)))
                throw new IncorrectCredentialsException(
                    'incorrect transaction pin!',
                );

            if (data.newPin !== data.confirmPin)
                throw new IncorrectCredentialsException('Pin mismatch!');

            user.transactionPin = hashCred(data.newPin);
            await user.save();
            return {
                statusCode: HttpStatus.OK,
                message: 'transaction pin updated successfully',
            };
        } catch (error) {
            throw new IncorrectCredentialsException(error.message);
        }
    }
}
