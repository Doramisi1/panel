import http, { FractalResponseData, FractalResponseList, getPaginationSet, PaginatedResult } from '@/api/http';
import { createContext, useContext } from 'react';
import useSWR from 'swr';
import { Egg, rawDataToEgg } from '@/api/admin/eggs/getEgg';

export interface Nest {
    id: number;
    uuid: string;
    author: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;

    relations: {
        eggs: Egg[] | undefined;
    },
}

export const rawDataToNest = ({ attributes }: FractalResponseData): Nest => ({
    id: attributes.id,
    uuid: attributes.uuid,
    author: attributes.author,
    name: attributes.name,
    description: attributes.description,
    createdAt: new Date(attributes.created_at),
    updatedAt: new Date(attributes.updated_at),

    relations: {
        eggs: ((attributes.relationships?.eggs as FractalResponseList | undefined)?.data || []).map(rawDataToEgg),
    },
});

interface ctx {
    page: number;
    setPage: (value: number | ((s: number) => number)) => void;
}

export const Context = createContext<ctx>({ page: 1, setPage: () => 1 });

export default (include: string[] = []) => {
    const { page } = useContext(Context);

    return useSWR<PaginatedResult<Nest>>([ 'nests', page ], async () => {
        const { data } = await http.get('/api/application/nests', {
            params: {
                include: include.join(','),
                per_page: 10,
                page,
            },
        });

        return ({
            items: (data.data || []).map(rawDataToNest),
            pagination: getPaginationSet(data.meta.pagination),
        });
    });
};
