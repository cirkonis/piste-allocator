"use client";

import React, {useState, useEffect} from 'react';
import {Group} from "@/interfaces/group";
import {calculateRounds} from "@/utility/calculateRounds";


export default function Page() {
    const [groups, setGroups] = useState<Group[]>([
        {name: 'Epee', numberOfFencers: 4, numberOfPistes: 2},
        {name: 'Foil', numberOfFencers: 4, numberOfPistes: 2},
        {name: 'Saber', numberOfFencers: 4, numberOfPistes: 2},
    ]);

    const [duration, setDuration] = useState<number>(5);
    const [results, setResults] = useState<{ name: string; rounds: number; timeToMeetAll: number; pisteUtilizationRatio: number }[]>([]);
    const [maxPistes, setMaxPistes] = useState<number>(6);

    const updateGroup = (updatedGroup: Group) => {
        setGroups(groups.map((group) => (group.name === updatedGroup.name ? updatedGroup : group)));
    };

    const [suggestedAllocation, setSuggestedAllocation] = useState<number[]>([]);

    const [showMore, setShowMore] = useState<boolean>(false);
    const generatePisteAllocations = (numPistes: number, numGroups: number): number[][] => {
        if (numGroups === 1) {
            return [[numPistes]];
        }
        let allocations: any = [];
        for (let i = 0; i <= numPistes; i++) {
            let subAllocations = generatePisteAllocations(numPistes - i, numGroups - 1);
            subAllocations.forEach((subAllocation) => allocations.push([i, ...subAllocation]));
        }
        return allocations;
    };


    useEffect(() => {
        setResults(calculateRounds(groups, duration, maxPistes));

        // Find allocation that gives closest utilization ratio to 1 for each group
        let bestAllocation: any = [];
        let bestDiff = Infinity;

        let allocations = generatePisteAllocations(maxPistes, groups.length);
        allocations.forEach((allocation) => {
            let totalDiff = 0;
            let tempGroups = groups.map((group, i) => ({...group, numberOfPistes: allocation[i]}));
            let tempResults = calculateRounds(tempGroups, duration, maxPistes);
            tempResults.forEach((result) => {
                totalDiff += Math.abs(1 - result.pisteUtilizationRatio);
            });
            if (totalDiff < bestDiff) {
                bestDiff = totalDiff;
                bestAllocation = allocation;
            }
        });

        setSuggestedAllocation(bestAllocation);
    }, [groups, duration, maxPistes]);

    const totalPistesAllocated = groups.reduce((total, group) => total + group.numberOfPistes, 0);
    const isMaxPistesReached = totalPistesAllocated === maxPistes;

    const handleNumberOfPistesChange = (group: Group, numberOfPistes: number) => {
        if (numberOfPistes > group.numberOfPistes && isMaxPistesReached) return;
        updateGroup({...group, numberOfPistes});
    };

    const handleApplySuggested = () => {
        const updatedGroups = groups.map((group, i) => ({...group, numberOfPistes: suggestedAllocation[i]}));
        setGroups(updatedGroups);
    };

    return (
        <div className="text-black bg-white p-6 max-w-md mx-auto">
            <div className="flex flex-row justify-between">
                <label className="block mb-4">
                    Fencing Time
                    <input
                        className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        type="number"
                        min="1"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                    />
                    <p
                        className={`italic pt-2`}
                    >
                        in minutes
                    </p>
                </label>
                <div className="mb-6">
                    <label className="block mb-2">
                        Max Piste
                        <input
                            className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            type="number"
                            min="3"
                            value={maxPistes}
                            onChange={(e) => setMaxPistes(Math.max(Number(e.target.value), 3))}
                        />
                    </label>
                    <p
                        className={`font-bold ${
                            isMaxPistesReached ? 'text-green-500' : totalPistesAllocated > maxPistes ? 'text-red-500' : ''
                        }`}
                    >
                        Total Piste Allocated: {totalPistesAllocated}
                    </p>
                </div>
            </div>
            <div className="flex flex-row-wrap justify-evenly">
                {groups.map((group) => (
                    <div key={group.name} className="mb-6">
                        <h2 className="text-xl font-bold">{group.name}</h2>
                        <label className="block mt-2">
                            Fencers:
                            <input
                                className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                type="number"
                                min="2"
                                value={group.numberOfFencers}
                                onChange={(e) => updateGroup({...group, numberOfFencers: Number(e.target.value)})}
                            />
                        </label>
                        <label className="block mt-2">
                            Pistes:
                            <input
                                className="mt-1 block w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                type="number"
                                min="0"
                                value={group.numberOfPistes}
                                onChange={(e) => handleNumberOfPistesChange(group, Number(e.target.value))}
                            />
                        </label>
                    </div>
                ))}
            </div>
            <div className="flex flex-row justify-between">
                <h2 className="text-xl font-bold">
                    Results:
                </h2>
                <button
                    className="ml-1 px-2 py-1 bg-blue-500 text-white text-xs rounded-md"
                    onClick={() => setShowMore(!showMore)}
                >
                    {showMore ? 'Less' : 'More'} info
                </button>
            </div>

            {results.map((result) => (
                <div key={result.name} className="mb-6">
                    <h3 className="text-lg font-semibold">{result.name}</h3>
                    {showMore ? (
                        <>
                            <div className="flex justify-between">
                                <p>Rounds to meet everyone:</p>
                                <p className="font-bold">{result.rounds}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Time to fence everyone:</p>
                                <p className="font-bold">{result.timeToMeetAll}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Piste Utilization Ratio:</p>
                                <p className="font-bold">{result.pisteUtilizationRatio.toFixed(2)}</p>
                            </div>
                        </>
                    ) : (
                        <div className="flex justify-between">
                            <p>Piste Utilization Ratio:</p>
                            <p className="font-bold">{result.pisteUtilizationRatio.toFixed(2)}</p>
                        </div>
                    )}
                </div>
            ))}
            <h2 className="text-xl font-bold text-center">Suggested Piste Allocation</h2>
            <div className="flex flex-row justify-evenly">
                {groups.map((group, i) => (
                    <div key={group.name} className="mb-6">
                        <h3 className="text-lg font-semibold">{group.name}: <span
                            className="font-bold">{suggestedAllocation[i]}</span></h3>
                    </div>
                ))}
            </div>
            <div className="flex flex-row justify-center">
                <button
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
                    onClick={handleApplySuggested}
                >
                    Apply Suggested
                </button>
            </div>
        </div>
    );

}