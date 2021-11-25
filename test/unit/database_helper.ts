import { Connection } from "typeorm"

export const clearDatabase = async(connection: Connection): Promise<void> => {
    try {
        const tables: Array<any> = await connection.query('SHOW TABLES');
        const tableNames: Array<string> = tables.map(table => table.Tables_in_hkadmin);
        //await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
        const queryString = `
          SET FOREIGN_KEY_CHECKS = 0;
          ${tableNames.map( tableName => `TRUNCATE TABLE \`${tableName}\`;`).join('\n')}
          SET FOREIGN_KEY_CHECKS = 1;
         `
        try {
            await connection.query(queryString);
        } catch(error) {
            console.log('Error', error.message);
        }
        //await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    } catch (error) {
        console.log('error', error.message);
    }
}
