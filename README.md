# M-wallet

![CircleCI](https://img.shields.io/circleci/build/github/E-wave112/m-wallets?token=bff5adf48f3d1acce9b2f433755a99ac1503192f)

A simple P2P wallet system developed with NestJS, Typeorm and MySQL 

## This API assumes the following functionalities and constraints to enforce security and integrity
- A security private key will be generated for users on sign up
- Abilities for users to be able to fund (with either card or bank transfer) and withdraw money to their wallet using the [Flutterwave](https://flutterwave.com/us/) payment gateway.
- users will be able to perform peer to peer transactions to other users and withdraw from their wallet using their transaction pin.
- during the peer to peer transaction, the sender and receiver will receive email notifications of the transaction.
- users can only use that security key for recovering their transaction pin.
- The security key has to be kept in an ultrasafe manner as there is no way for users to recover their account once they lose the key

- Live URL [here](https://m-wallets.herokuapp.com/api/v1)
- Find the API documentation [here](https://documenter.getpostman.com/view/11690328/UzQvtRBn)


### Install Pacakges

```
$ npm install
```
or

```
$ yarn
```
Then you can then finally start the development server with the command

```
$ npm run start:dev
```
or

```
$ yarn start:dev
```

### Dockerizing the development environment

use the command below to build the docker image
```
docker-compose up --build
```
### Running the Dev Docker container

To run the application, use the command below:

```
$ docker-compose up
```

the server will be running on http://localhost:8000

### Next steps? deploy to dockerhub 

- A useful resource on how to push your docker image to [DockerHub](https://hub.docker.com)  can be found [here](https://ropenscilabs.github.io/r-docker-tutorial/04-Dockerhub.html)

