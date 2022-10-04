import { defineStore } from "pinia"; 
import { useTaskFirestore } from ".";

const { getTaskByMatrix } = useTaskFirestore()

export const useMatrixStore = defineStore('matrix', {
    state: () => {
        return {
            matrix: {
                todo: {
                  ref: null,
                  list: [],
                  classes: "text-green-400",
                  loaded: false,
                },
                schedule: {
                  ref: null,
                  list: [],
                  classes: "text-blue-400",
                  loaded: false,
                },
                delegate: {
                  ref: null,
                  list: [],
                  classes: "text-yellow-400",
                  loaded: false,
                },
                delete: {
                  ref: null,
                  list: [],
                  classes: "text-red-400",
                  loaded: false,
                },
            }
        };
    },
    actions: {
        getMatrix(matrixName) {
            getTaskByMatrix(matrixName).then((collectionRef) => {
                state.matrix[matrixName].ref = collectionRef.onSnapshot((snap) => {
                state.matrix[matrixName].list = [];
                snap.forEach((doc) => {
                    state.matrix[matrixName].list.push({ ...doc.data(), uid: doc.id });
                });
                state.matrix[matrixName].loaded = true;
                });
            });
        },
        fetchMatrix() {
            Object.keys(state.matrix).forEach((matrixName) => {
                this.getMatrix(matrixName);
            });
        }
    },
    getters: {
        isMatrixLoaded: (state) => {
            return Object.values(state)
              .map((item) => item.loaded)
              .every((isLoaded) => isLoaded);
        }
    }
})