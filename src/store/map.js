import { defineStore } from "pinia";   
import { getMapIconApi } from "@/api/map";

export const useMapStore = defineStore('map', {
  state: () => ({
    mapInfo: {
        iconUrl: null,
    },
  }),
  actions: {
    setIconUrl(url) {
      this.mapInfo.iconUrl = url;
    },
    async getMapIcon(objectKey, expiresSeconds) {
        try {
            const res = await getMapIconApi({objectKey, expiresSeconds});
            if(res.code !== 1){
                return Promise.reject(res.message);
            }
            this.setIconUrl(res.data.url);
            return res.data;
        } catch (error) {
            return Promise.reject(error);
        }
    }
  }
})
