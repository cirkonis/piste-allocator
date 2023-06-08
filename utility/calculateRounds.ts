import {Group} from "@/interfaces/group";
import {combinations} from "@/utility/combinations";

export const calculateRounds = (groups: Group[], duration: number, maxPistes: number) => {
    // Calculate total demand for all groups
    const totalDemand = groups.reduce((total, group) => {
        const totalPairs = combinations(group.numberOfFencers, 2);
        const rounds = Math.ceil(totalPairs / group.numberOfPistes);
        return total + group.numberOfFencers * rounds;
    }, 0);

    return groups.map((group) => {
        const totalPairs = combinations(group.numberOfFencers, 2);
        const rounds = Math.ceil(totalPairs / group.numberOfPistes);
        const timeToMeetAll = rounds * duration;

        // Calculate demand for this group and its normalized demand
        const groupDemand = group.numberOfFencers * rounds;
        const normalizedDemand = groupDemand / totalDemand;

        // Calculate piste utilization ratio
        const pisteUtilizationRatio = group.numberOfPistes / (normalizedDemand * maxPistes);

        return { name: group.name, rounds, timeToMeetAll, pisteUtilizationRatio };
    });
};