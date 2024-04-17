import { BadRequestException, HttpException } from '@nestjs/common';
import { DeleteResult, InsertResult, QueryResult, UpdateResult } from 'typeorm';
import dayjs from 'dayjs';
import { baseConfig } from 'src/config/base.config';
import AWS from 'aws-sdk';

export const mapOutput = (arr: any) => {
	return arr.map((val: QueryResult) => output(val).message).includes('fail');
};

export const output = (data: QueryResult) => {
	return {
		statusCode: data.raw.affectedRows === 0 && data.affected === 0 ? 409 : 200,
		message: data.raw.affectedRows > 0 || data.affected > 0 ? 'success' : 'fail',
	};
};

export const insertQuery = async (repo: any, dto: any, update: any = undefined) => {
	// console.log(repo, 'REPO!!!!!!!');
	// console.log(dto, 'DTO!!!!!');
	const keys = Object.keys(dto);
	const values = {};
	repo.metadata.columns
		.filter((val: any) => !val.isPrimary && keys.includes(val.propertyName))
		.map((val: any) => (values[val.propertyName] = dto[val.propertyName]));

	try {
		// for (const key in values) {
		//   if (typeof values[key] === 'string') {
		//     values[key] = escapeString(values[key]);
		//   }
		// }

		const qb = await repo.manager.createQueryBuilder().insert().into(repo.metadata.tableName).values(values);

		if (update) {
			qb.orUpdate((update[0], update[1]));
		}

		return qb.execute();
	} catch (err) {
		console.log(err);
		throw new BadRequestException('잘못된 요청입니다.');
	}
};

export const updateQuery = async (repo: any, dto: any, where: any) => {
	const keys = Object.keys(dto);
	const set = {};
	repo.metadata.columns
		.filter((val: any) => !val.isPrimary && keys.includes(val.propertyName))
		.map((val: any) => (set[val.propertyName] = dto[val.propertyName]));

	try {
		// for (const key in set) {
		//   if (typeof set[key] === 'string') {
		//     set[key] = escapeString(set[key]);
		//   }
		// }

		return await repo.manager.createQueryBuilder().update(repo.metadata.tableName).set(set).where(where).execute();
	} catch (err) {
		console.log(err);
		throw new BadRequestException('잘못된 요청입니다.');
	}
};

export const deleteQuery = async (repo: any, where: any) => {
	try {
		return await repo.manager.createQueryBuilder().delete().from(repo.metadata.tableName).where(where).execute();
	} catch (err) {
		console.log(err);
		throw new BadRequestException('잘못된 요청입니다.');
	}
};

export const selectQuery = async (callback: any) => {
	try {
		return await callback();
	} catch (err) {
		console.log(err);
		throw new BadRequestException('잘못된 요청입니다.');
	}
};

export const transaction = async (connection: any, callback: any) => {
	const queryRunner = connection.createQueryRunner();

	await queryRunner.connect();
	await queryRunner.startTransaction();
	try {
		const cb = await callback(queryRunner.manager);

		if (cb.map((val: any) => val.raw.affectedRows || val.affected).includes(0)) {
			// 실패
			console.log('트랜잭션 실패');
			await queryRunner.rollbackTransaction();
			throw new BadRequestException();
		}

		await queryRunner.commitTransaction();

		return cb;
	} catch (err) {
		console.log(err);
		await queryRunner.rollbackTransaction();
		throw new BadRequestException(err.response.message, err.response.error);
	} finally {
		await queryRunner.release();
	}
};

export const escapeString = (str: string) => {
	return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char: string) => {
		switch (char) {
			case '\0':
				return '\\0';
			case '\x08':
				return '\\b';
			case '\x09':
				return '\\t';
			case '\x1a':
				return '\\z';
			case '\n':
				return '\\n';
			case '\r':
				return '\\r';
			case '"':
			case "'":
			case '\\':
			case '%':
				return '\\' + char;
		}

		return char;
	});
};

export const getNow = (str = 'YYYYMMDDHHmmssSSS') => {
	return dayjs().format(str);
};

export const isNumber = (num: number) => {
	if (isNaN(num)) {
		throw new BadRequestException('Validation failed (numeric string is expected)');
	}

	return num;
};

export const isString = (str: string) => {
	return typeof str === 'string';
};

export const isEmpty = (str: string) => {
	if (!isString(str) || str.trim().length === 0) {
		throw new BadRequestException('Validation failed (string is expected)');
	}

	return str;
};

export const filterObject = (obj: any, keys: string[]) => {
	return Object.fromEntries(Object.entries(obj).filter(([key]) => keys.includes(key)));
};

export const hasProperty = (obj: any) => {
	if (typeof obj !== 'object' || obj === null) {
		return;
	}

	const insertProperty = Object.getOwnPropertyNames(InsertResult.from(new QueryResult()));
	const updateProperty = Object.getOwnPropertyNames(UpdateResult.from(new QueryResult()));
	const deleteProperty = Object.getOwnPropertyNames(DeleteResult.from(new QueryResult()));

	return (
		typeof obj === 'object' &&
		Object.getOwnPropertyNames(obj).some(
			(item) => insertProperty.includes(item) || updateProperty.includes(item) || deleteProperty.includes(item)
		)
	);
};

export const getExpireTime = (str: string) => {
	const now = Date.now();

	switch (str.slice(-1)) {
		case 's':
			return Math.floor(now / 1000) + parseInt(str.slice(0, -1));

		case 'm':
			return Math.floor(now / 1000) + parseInt(str.slice(0, -1)) * 60;

		case 'h':
			return Math.floor(now / 1000) + 60 * 60 * parseInt(str.slice(0, -1));

		case 'd':
			return Math.floor(now / 1000) + 60 * 60 * 24 * parseInt(str.slice(0, -1));
	}
};

export const uploadFileToBucket = async (file: any, name: any) => {
	// AWS.config.update({
	// 	accessKeyId: baseConfig.aws.bucket.accessKeyId,
	// 	secretAccessKey: baseConfig.aws.bucket.secretAccessKey,
	// });
	// indonesia/${name}.${file.originalname.split('.').slice(-1)}
	// const s3 = new AWS.S3();
	// console.log(file, '???????');
	// console.log(name, '???????');
	try {
		const key = name;

		// await s3
		// 	.putObject({
		// 		Bucket: baseConfig.aws.bucket.name,
		// 		Key: key,
		// 		Body: file.buffer,
		// 	})
		// 	.promise();

		return key;
	} catch (err) {
		console.log(err);
	}
};

export const timeChange = (input: { type: string; str: any; end: any }) => {
	if (input.end && input.str && input.type) {
		switch (input.type) {
			case 'D':
				input.str += '000000000';
				input.end += '235959999';
				break;
		}
		return input;
	} else {
		return null;
	}
};

