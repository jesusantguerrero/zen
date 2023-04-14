import { toRef, reactive, toRefs } from "vue";
import { useCollection } from "./firebase/useCollection";

const { getAll } = useCollection();

export const connectionState = reactive({
    list: [],
    fetchedAt: null,
    loading: false,
    error: null,
    reference: null
})

export const useIntegrations = () => {
    const fetchList = () => {
        if (!connectionState.reference) {
            connectionState.reference = getAll("connections").onSnapshot(snap => {
                const list = [];
                snap.forEach((connection) => {
                    list.push({ uid: connection.id, ...connection.data() });
                });
                connectionState.list = list;
                connectionState.fetchedAt = Date.now();
                connectionState.loading = false;
                console.log('loaded');
            });
        }
    }

    const getList = () => {
        fetchList();
        const { list } = toRefs(connectionState);
        return list;
    }

    const closeConnections = () => {
      if (connectionState.reference) {
          connectionState.reference();
      }
    }

    return {
        connections: toRef(connectionState.list),
        connectionState,
        getList,
        closeConnections,
    }
};