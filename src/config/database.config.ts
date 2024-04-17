import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
	type: 'mysql',
	host: 'ls-4b41327dfe09d5703b9b88f78e8fdabe501d4deb.cdyy6u06m4x3.ap-northeast-2.rds.amazonaws.com',
	port: 3306,
	username: 'master',
	password: 'lhj8668368',
	database: 'dbmaster',
	autoLoadEntities: true,
	entities: [__dirname + '/entities/*.entity{.d.ts,.js}'],
	synchronize: true,
	logging: true,
};

