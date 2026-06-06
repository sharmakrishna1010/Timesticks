import cron from 'node-cron';
import Habit from '../models/habit.model.js';

cron.schedule('0 0 * * *', async () => {
    console.log('Running midnight habit reset...');
    try {
        await Habit.updateMany(
            { todayStatus: false }, 
            { $set: { currentStreak: 0 } }
        );

        await Habit.updateMany(
            {}, 
            { $set: { todayStatus: false } }
        );
        console.log('Habit reset complete.');
    } catch (error) {
        console.error('Cron Job Failed:', error);
    }
});