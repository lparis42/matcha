// import handleClientBrowsing from "./handleClientBrowsing";

// // Method to research clients by filters : age, distance, popularity, tags
// async function handleClientResearch(socket, data, cb) {
//     try {
//         await handleClientBrowsing(socket, data, (cb) => { 

//         });
//         // Extract data
//         const session_account = await this.getSessionAccount(socket.handshake.sessionID);
//         if (!session_account) {
//             throw { client: 'Cannot request research while not logged in', status: 401 };
//         }
//         const { age_min, age_max, dist_min, dist_max, fame_min, fame_max, tags } = data;
//         if (age_min && typeof age_min !== 'number' || age_max && typeof age_max !== 'number' ||
//             dist_min && typeof dist_min !== 'number' || dist_max && typeof dist_max !== 'number' ||
//             fame_min && typeof fame_min !== 'number' || fame_max && typeof fame_max !== 'number' ||
//             tags && !Array.isArray(tags) && tags.some(tag => typeof tag !== 'number')) {
//             throw { client: 'Invalid data', status: 400 };
//         }
//         const account_data = (await this.db.execute(
//             this.db.select('users_public',
//                 [`first_name`, `date_of_birth`, `gender`, `sexual_orientation`, `common_tags`, `pictures`, `fame_rating`, `geolocation`],
//                 `id = ${session_account}`)
//         ))[0];
        
        