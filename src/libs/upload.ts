import multer, { diskStorage } from 'multer';
import path, { extname } from 'path';
import { getNow, uploadFileToBucket } from 'src/common/util';
import StreamZip, { async } from 'node-stream-zip';
import fs from 'fs';
import { BadRequestException, Next } from '@nestjs/common';
import AdmZip from 'adm-zip';
export const setDestination = (file) => {
	// destination 기본경로
	let destination = '/';

	return destination;
};

// 파일 명 셋팅
export const setfilename = (name, file) => {
	let filename = 'filename';

	return filename;
};
/* multer 스토리지 (디스크 업로드)
   경로와 파일이름을 cb(callback)시켜줌
*/
export const storage = diskStorage({
	destination: function (req, file, cb) {
		const destination = setDestination(file);
		cb(null, destination);
	},
	filename: function (req, file, cb) {
		const filename = setfilename(req, file);
		cb(null, filename);
	},
});

// 파일 필터
export const fileFilter = (req, file, cb) => {
	if ([''].includes(file.fieldname)) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

// 파일 일괄 업로드
export const fileBulkUpload = async (filePath: any) => {
	let result = { entry: 0, file: [] };
	// 압축 해제
	const zip = new AdmZip(filePath);
	const zipEntries = zip.getEntries();
	// 압축 파일 버퍼 조회
	await zipEntries.forEach(async function (zipEntry) {
		result.entry++;
		// 파일 업로드(갯수리턴을 위한 비동기 처리)
		return new Promise((resolve) => {
			resolve(
				result.file.push(uploadFileToBucket({ buffer: zipEntry.getCompressedData() }, `/${zipEntry.entryName}`))
			);
		});
	});
	// 압축파일 삭제
	fs.rmSync(`${filePath}`, { recursive: true, force: false });
	return { entry: result.entry, file: result.file.length };
};

