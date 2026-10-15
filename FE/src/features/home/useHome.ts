import { useQuery } from '@tanstack/react-query'
import { homeApi } from './homeApi'

export const useHome = () => useQuery({ queryKey: ['home'], queryFn: homeApi.get })
