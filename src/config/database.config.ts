import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
	type: 'mysql',
	host: 'localhost',
	port: 3306,
	username: '',
	password: '',
	database: 'dbmaster',
	autoLoadEntities: true,
	entities: [__dirname + '/entities/*.entity{.d.ts,.js}'],
	synchronize: true,
	logging: true,
};

