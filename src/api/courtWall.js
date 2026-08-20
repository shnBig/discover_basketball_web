import request from './http';

export async function getCourtWallPage(params) {
  try {
    const res = await request.get('/court-wall/admin/page', { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function addCourtToWall(data) {
  try {
    const res = await request.post('/court-wall/admin/add', data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function removeCourtFromWall(courtId) {
  try {
    const res = await request.delete(`/court-wall/admin/${courtId}`);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function getContributionPage(params) {
  try {
    const res = await request.get('/court-wall/admin/contribution/page', { params });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function handleContribution(contributionId, data) {
  try {
    const res = await request.put(`/court-wall/admin/contribution/${contributionId}/handle`, data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function hasCourtWall(courtId) {
  try {
    const res = await request.get('/court-wall/admin/hasWall', { params: { courtId } });
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function handleCourtContributions(courtId, data) {
  try {
    const res = await request.put(`/court-wall/admin/court/${courtId}/contributions/handle`, data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}

export async function rejectContribution(data) {
  try {
    const res = await request.put('/court-wall/admin/contribution/reject', data);
    return res.data;
  } catch (error) {
    return Promise.reject(error);
  }
}