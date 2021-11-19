import { Connection } from "typeorm"

export const clearDatabase = async(connection: Connection): Promise<void> => {
    try {
        const tables: Array<any> = await connection.query('SHOW TABLES');
        const tableNames: Array<string> = tables.map(table => table.Tables_in_hkadmin_test);

        await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
        for (const tableName of tableNames){
            try {
                await connection.query(`TRUNCATE TABLE \`${tableName}\`;`)
            } catch(error) {
                console.log('Error truncating table', tableName);
                console.log('Error', error.message);
            }
        }
        await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    } catch (error) {
        console.log('error', error.message);
    }
}
