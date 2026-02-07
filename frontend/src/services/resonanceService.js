import api from "./api";

export const broadcastSignal = async (signalData) => {
    try {
        const res = await api.post("/resonance/broadcast", signalData);
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || "Failed to broadcast signal");
    }
};

export const tuneSignals = async () => {
    try {
        const res = await api.get("/resonance/tune");
        return res.data;
    } catch (err) {
        if (err.response?.status === 401) throw new Error("Unauthorized");
        throw new Error(err.response?.data?.message || "Failed to fetch signals");
    }
};
