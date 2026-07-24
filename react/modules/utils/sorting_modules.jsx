
import { useMemo } from 'react';
import { normalizeTimestamp } from './timestamp_utils.jsx';

export const useSortedData = (data_array, sortBy_property, asc_or_desc_string = 'asc') => {

    // data_array: a JS ARRAY of OBJECTS with at least 1 sortable property
    // sortBy_property: a STRING for the property to sort by (this key must be on each object in array)
    // asc_or_desc_string: a STRING ('asc' or 'desc') for which direction to sort (ascending/descending)

    return useMemo(() => {
        if (!Array.isArray(data_array)) return [];
        return [...data_array].sort((a, b) => {

            // convertible vars
            let valA = a[sortBy_property];
            let valB = b[sortBy_property];

            // Normalize timestamps: Postgres returns ISO without Z, Node echoes
            // with Z — without normalizing, fresh messages sort wrong vs old ones.
            if (sortBy_property === 'timestamp') {
                valA = normalizeTimestamp(valA);
                valB = normalizeTimestamp(valB);
            }

            // ascending or descending sort
            if (asc_or_desc_string === 'asc') {
                if (valA < valB) return -1;
                if (valA > valB) return 1;
            } else if (asc_or_desc_string === 'desc') {
                if (valA < valB) return 1;
                if (valA > valB) return -1;
            }
            return 0; // if values are equal

        });
    }, [data_array, sortBy_property, asc_or_desc_string]);
};
