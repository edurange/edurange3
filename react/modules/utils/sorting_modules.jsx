
import { useMemo } from 'react';

export const useSortedData = (data_array, sortBy_property, asc_or_desc_string = 'asc') => {

    // data_array: a JS ARRAY of OBJECTS with at least 1 sortable property (PROPERTY MUST BE ARRAY)
    // sortBy_property: a STRING for the property to sort by (this key must be on each object in array)
    // asc_or_desc_string: a STRING ('asc' or 'desc') for which direction to sort (ascending/descending) 

    return useMemo(() => {
        return [...data_array].sort((a, b) => {

            // convertible vars
            let valA = a[sortBy_property];
            let valB = b[sortBy_property];
            
            // convert if necessary
            if (sortBy_property === 'timestamp') {
                valA = new Date(valA).getTime(); // Convert to numeric timestamp
                valB = new Date(valB).getTime();
            }

            // COMPARITOR BLOCK
            // ascending or descending sort
            if (asc_or_desc_string === 'asc') {
                if (valA < valB) return -1;
                if (valA > valB) return 1;
            } else if (asc_or_desc_string === 'desc') {
                if (valA < valB) return 1;
                if (valA > valB) return -1;
            } else {
                throw new Error("Invalid asc_or_desc_string argument. Use 'asc' or 'desc'.");
            }
            return 0; // if values are equal

        });
    }, [data_array, sortBy_property, asc_or_desc_string]);
};
