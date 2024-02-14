const admin = require('firebase-admin');
const {format } = require("date-fns");

exports.getGroupedTracks = async (userUid,  date = new Date()) => {
    const tracks = await this.getTracksByDates(userUid, date);
    const trackGroup = {};

    tracks.forEach((track) => {
        const date = format(track.started_at, "yyyy-MM-dd");
        if (!track.ended_at) return
        if (!trackGroup[date]) {
            trackGroup[date] = {
                [track.description]: {
                    id: `group-${track.uid}`,
                    description: track.description,
                    isLoading: false,
                    tracks: [track]
                }
            };
        } else {
            if (!trackGroup[date][track.description]) {
                trackGroup[date][track.description] = {
                        id: `group-${track.uid}`,
                        description: track.description,
                        tracks: [track]
                };
            } else {
                trackGroup[date][track.description].tracks.push(track);
            }
        }
    });
    return trackGroup;
}

exports.getTracksByDates = async (userUid, startDate = new Date(), endDate) => {
    const start = new Date(DateTime.fromJSDate(startDate).startOf('day'))
    const end = new Date(DateTime.fromJSDate(endDate || startDate).endOf('day'))
    
    return admin.firestore().collection('tracks')
    .where("user_uid", "==", userUid)
    .where('started_at', ">=", start)
    .where('started_at', "<=", end)
    .get().then( snap => {
        const tracks = [];
        snap.forEach( item => {
            tracks.push({
                ...item.data(),
                uid: item.id
            })
        })

        return tracks;
    })
}

