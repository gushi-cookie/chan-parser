/**
* Wrap a get query with a promise.
* @param {string} sql 
* @param {Array} param 
* @param {Database} db 
* @returns {Promise.<Object | null>}
* @throws {SQLiteError}
*/
const wrapGetQuery = async (sql, param, db) => {
    return new Promise((resolve, reject) => {
        db.get(sql, param, (error, row) => {
            if(error) {
                reject(error);
            } else if(row === undefined) {
                resolve(null);
            } else {
                resolve(row);
            }
        });
    });
};

/**
 * Wrap an exec query with a promise.
 * @param {string} sql 
 * @param {Database} db 
 * @throws {SQLiteError}
 */
const wrapExecQuery = async (sql, db) => {
    return new Promise((resolve, reject) => {
        db.exec(sql, (error) => {
            if(error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

/**
 * Wrap an all query with a promise.
 * @param {string} sql 
 * @param {Array} param 
 * @param {Database} db 
 * @returns {Promise.<Array>}
 * @throws {SQLiteError}
 */
const wrapAllQuery = async (sql, param, db) => {
    return new Promise((resolve, reject) => {
        db.all(sql, param, (error, rows) => {
            if(error) {
                reject(error);
            } else {
                resolve(rows);
            }
        });
    });
};


module.exports = {
    wrapGetQuery,
    wrapExecQuery,
    wrapAllQuery,
};