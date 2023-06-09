const File = require('../../threads-observer-service/commons/File');
const StashFile = require('../../file-stasher-service/commons/StashFile');
const DBUtils = require('./DBUtils');

/**
 * Class represents the files database table.
 */
class StoredFile {

    /**
     * Create an instance of the StoredFile class.
     * @param {number} id 
     * @param {number} postId 
     * @param {number} listIndex 
     * @param {string} url 
     * @param {string} thumbnailUrl 
     * @param {string} uploadName 
     * @param {string} cdnName 
     * @param {string} checkSum 
     * @param {boolean} isDeleted 
     * @param {string} extension 
     * @param {Buffer} data 
     * @param {Buffer} thumbnailData
     */
    constructor(id, postId, listIndex, url, thumbnailUrl, uploadName, cdnName, checkSum, isDeleted, extension, data, thumbnailData) {
        this.id = id;
        this.postId = postId;
        this.listIndex = listIndex;
        this.url = url;
        this.thumbnailUrl = thumbnailUrl;
        this.uploadName = uploadName;
        this.cdnName = cdnName;
        this.checkSum = checkSum;
        this.isDeleted = isDeleted;

        this.extension = extension;
        this.data = data;
        this.thumbnailData = thumbnailData;
    };


    /**
     * Convert a class's field to snake case. 
     * @param {string} name Name of the field.
     * @throws {Error} Thrown if a prototype of the class has no property with the passed name.
     */
    static convertFieldToSnakeCase(name) {
        if(!Object.getOwnPropertyNames(new StoredFile()).includes(name)) {
            throw new Error(`Class StoredFile has no a field with the name: ${name}.`);
        }
        return DBUtils.camelToSnakeCase(name);
    };


    /**
     * Create a StoredFile instance from the files table row.
     * 
     * Note: all columns from the table are required, except for NULLABLE ones.
     * @param {Object} row 
     * @returns {StoredFile}
     */
    static makeFromTableRow(row) {
        let file = new StoredFile(row.id, row.post_id, row.list_index, row.url, row.thumbnail_url, row.upload_name, row.cdn_name, row.check_sum, Boolean(row.is_deleted), row.extension, null, null);
        
        if(row.extension === undefined) file.extension = null;
        if(row.data !== undefined) file.data = row.data;
        if(row.thumbnail_data !== undefined) file.thumbnailData = row.thumbnail_data;

        return file;
    };

    /**
     * Form a StoredFile instance from an observer File instance.
     * @param {File} file
     * @returns {StoredFile}
     */
    static makeFromObserverFile(file, postId) {
        return new StoredFile(file.id, postId, file.listIndex, file.url, file.thumbnailUrl, file.uploadName, file.cdnName, file.checkSum, file.isDeleted, null, null, null);
    };


    /**
     * Convert this file to the File type of the ThreadsObserverService service.
     * @returns {File}
     */
    toObserverFile() {
        let file = new File(this.listIndex, this.url, this.thumbnailUrl, this.uploadName, this.cdnName, this.checkSum, this.isDeleted);
        file.id = this.id;
        return file;
    };
};

module.exports = StoredFile;