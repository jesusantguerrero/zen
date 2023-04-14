import { defineStore } from 'pinia'
import { useCollection } from '@/utils/firebase/useCollection'

const { save: addCycle, getAll: getAllCycles, update: updateCycle, destroy: removeCycle } = useCollection('cycles', 'objectives', [
  'title',
  'description',
  'startDate',
  'endDate',
])

export interface ICycle {
  title: string
  description: string
  startDate: Date
  endDate: Date
}

export const useCycleStore = defineStore({
  id: 'cycles',
  state: () => {
    return {
      data: [],
    }
  },
  actions: {
    async fetch() {
      const data = await getAllCycles().get().then(snap => {
        const cycles: any[] = []
        snap.forEach((doc) => {
          cycles.push({...doc.data(), uid: doc.id });
        });
        return cycles;
      })
      this.data = data;
    },
    async add(payload: ICycle) {
      return await addCycle(payload)
    },
    async update(payload: ICycle) {
      return await updateCycle(payload)
    },
    remove(id: string) {
      return removeCycle(id)
    },
  },
})
