import { addApplicationToTraining, parseTrainingApplications, removeApplicationFromTraining } from './utils';

describe('Utils', () => {
    describe('parseTrainingApplications', () => {
        it('returns empty array for empty string', () => {
            const result = parseTrainingApplications('');

            expect(result).toEqual([]);
        });
        it('returns correctly splitted array for one application', () => {
            const result = parseTrainingApplications('1 2 coach ');

            expect(result).toEqual([{userId: 1, groupId: 2, role: 'coach'}]);
        });
        it('returns correctly splitted array for multiple applications', () => {
            const result = parseTrainingApplications('1 2 coach;3 4 trainee');

            expect(result).toEqual([
                {userId: 1, groupId: 2, role: 'coach'},
                {userId: 3, groupId: 4, role: 'trainee'}]);
        });
    });
    describe('addApplicationToTraining', () => {
        const applicationToAdd = {
            userId: 1, groupId: 1, role: 'testRole'
        };
        it('returns the stringify application when there were previously no applications', () => {
            const result = addApplicationToTraining(applicationToAdd, '');

            expect(result).toEqual('1 1 testRole');
        });
        it('returns the correct array the application string is not empty', () => {
            const result = addApplicationToTraining(applicationToAdd, '2 2 test');
            expect(result).toEqual('2 2 test;1 1 testRole');
        });
    });
    describe('removeApplicationFromTraining', () => {
        const testApplicationString = '1 1 testRole;2 2 test;3 3 sweet';
        const testApplicationToRemove = {
            userId: 2, groupId: 2, role: 'test'
        };
        it('throws error when the application string is empty', () => {
            expect(() => removeApplicationFromTraining(testApplicationToRemove, '')).toThrow('Cannot remove application because there are no applications saved');
        });
        it('removes the correct application', () => {
            const result = removeApplicationFromTraining(testApplicationToRemove, testApplicationString);
            expect(result).toEqual('1 1 testRole;3 3 sweet');
        });
    });
});
