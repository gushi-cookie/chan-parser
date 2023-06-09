const StoredFile = require('../commons/StoredFile');
const DBUtils = require('./DBUtils');


/**
 * Class represents queries for working with the files table.
 */
class FileQueries {

    /**
     * Create an instance of the FileQueries class.
     * @param {Database} database 
     */
    constructor(database) {
        this.database = database;
    };


    /**
     * Create files table if not exists, in the database.
     * @throws {SQLiteError}
     */
    async createTable() {
        let sql = 
        `CREATE TABLE IF NOT EXISTS files (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id        INTEGER NOT NULL,
            list_index     INTEGER NOT NULL,
            url            TEXT NOT NULL,
            thumbnail_url  TEXT NOT NULL,
            upload_name    TEXT NOT NULL,
            cdn_name       TEXT NOT NULL,
            check_sum      TEXT NOT NULL,
            is_deleted     INTEGER NOT NULL,
            extension      TEXT,
            data           BLOB,
            thumbnail_data BLOB,
            FOREIGN KEY (post_id)
                REFERENCES posts (id)
                ON DELETE CASCADE
                ON UPDATE NO ACTION
        );`;

        await DBUtils.wrapExecQuery(sql, this.database);
    };

    /**
     * Make a list of the files table columns, divided with commas.
     * @param {string[]} excludedColumns List of column names to be excluded from the returned list.
     * @returns {string} 'id, post_id, list_index,...'
     */
    static listTableColumns(excludedColumns) {
        let columns = ['id', 'post_id', 'list_index', 'url', 'thumbnail_url', 'upload_name', 'cdn_name', 'check_sum', 'is_deleted', 'extension', 'data', 'thumbnail_data'];

        let index;
        excludedColumns.forEach(name => {
            index = columns.indexOf(name);
            if(index !== -1) {
                columns.splice(index, 1);
            }
        });
        
        let result = '';
        columns.forEach(name => {
            result += `${name}, `;
        });
        return result.slice(0, result.length - 2);
    };

    /**
     * Select a specific file by its id.
     * @param {number} id Id of the file.
     * @param {string[]} excludedColumns Column names of the files table, which shouldn't be queried.
     * @returns {Promise.<StoredFile | null>}
     * @throws {SQLiteError}
     */
    async selectFileById(id, excludedColumns) {
        let sql = `SELECT ${FileQueries.listTableColumns(excludedColumns)} FROM files WHERE id = ${id};`;
        return StoredFile.makeFromTableRow(await DBUtils.wrapGetQuery(sql, [], this.database));
    };

    /**
     * Select a file by url.
     * @param {string} url Url of the file.
     * @param {string[]} excludedColumns Column names of the files table, which shouldn't be queried.
     * @returns {Promise.<StoredFile | null>}
     * @throws {SQLiteError}
     */
    async selectFileByUrl(url, excludedColumns) {
        let sql = `SELECT ${FileQueries.listTableColumns(excludedColumns)} FROM files WHERE url = '${url}';`;
        return StoredFile.makeFromTableRow(await DBUtils.wrapGetQuery(sql, [], this.database));
    };

    /**
     * Select the first file of a specific post, by its list_index column.
     * @param {number} postId Id of the post.
     * @param {string[]} excludedColumns Column names of the files table, which shouldn't be queried.
     * @returns {Promise.<StoredFile | null>}
     * @throws {SQLiteError}
     */
    async selectFirstFileOfPost(postId, excludedColumns) {
        let sql = `SELECT ${FileQueries.listTableColumns(excludedColumns)} FROM files WHERE post_id = ${postId} AND list_index = 0;`;

        let row = await DBUtils.wrapGetQuery(sql, [], this.database);
        if(row !== null) {
            return StoredFile.makeFromTableRow(row);
        } else {
            return null;
        }
    };

    /**
     * Select all files of a specific post.
     * @param {number} postId Id of the post.
     * @param {string[]} excludedColumns Column names of the files table, which shouldn't be queried.
     * @returns {Promise<StoredFile[]>} 
     * @throws {SQLiteError}
     */
    async selectFilesOfPost(postId, excludedColumns) {
        let sql = `SELECT ${FileQueries.listTableColumns(excludedColumns)} FROM files WHERE post_id = ${postId};`;
        let rows = await DBUtils.wrapAllQuery(sql, [], this.database);
        let files = [];
        for(let i = 0; i < rows.length; i++) {
            files.push(StoredFile.makeFromTableRow(rows[i]));
        }
        return files;
    };

    /**
     * Select all files of specific posts.
     * @param {number[]} postIDs Ids of posts.
     * @param {string[]} excludedColumns Column names of the files table, which shouldn't be queried.
     * @returns {Promise.<StoredFile[]>}
     * @throws {SQLiteError}
     */
    async selectFilesOfPosts(postIDs, excludedColumns) {
        if(postIDs.length === 0) return [];

        let ids = '';
        postIDs.forEach((id) => {
            ids += `${id},`;
        });
        ids = `(${ids.slice(0, ids.length - 1)})`;

        let sql = `SELECT ${FileQueries.listTableColumns(excludedColumns)} FROM files WHERE post_id IN ${ids};`;
        let rows = await DBUtils.wrapAllQuery(sql, [], this.database);

        let files = [];
        for(let i = 0; i < rows.length; i++) {
            files.push(StoredFile.makeFromTableRow(rows[i]));
        }
        return files;
    };


    /**
     * Insert a file in the files table.
     * 
     * Note: id property of the file may be null.
     * @param {StoredFile} file File to be inserted.
     * @returns {Promise.<number>} Id of the inserted file.
     * @throws {SQLiteError}
     */
    async insertFile(file) {
        let sql = 
        `INSERT INTO files(id, post_id, list_index, url, thumbnail_url, upload_name, cdn_name, check_sum, is_deleted, extension, data, thumbnail_data)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
        
        let result = await DBUtils.wrapRunQuery(sql, [file.id, file.postId, file.listIndex, file.url, file.thumbnailUrl, file.uploadName, file.cdnName, file.checkSum, file.isDeleted, file.extension, file.data, file.thumbnailData], this.database);
        return result.lastID;
    };


    /**
     * Update columns of a stored file in the files table.
     * 
     * Note: id property shouldn't be null. postId may be null.
     * @param {StoredFile} file File to be updated.
     * @param {String[]} fields Names of the StoredFile class's fields to update.
     * @throws {SQLiteError}
     */
    async updateFile(file, fields) {
        let sets = '';
        fields.forEach((field) => {
            sets += `${StoredFile.convertFieldToSnakeCase(field)} = ?,`;
        });
        sets = sets.slice(0, sets.length - 1);

        let sql = `UPDATE files SET ${sets} WHERE id = ${file.id};`;

        let params = [];
        fields.forEach((field) => {
            params.push(file[field]);
        });

        await DBUtils.wrapRunQuery(sql, params, this.database);
    };
};

module.exports = FileQueries;