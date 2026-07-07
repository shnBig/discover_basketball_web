import amapHttp from './amapHttp';

export const getCourtDataApi = async (params) => {
  try {
    const res = await amapHttp.get('/v5/place/text', { params });   
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}
