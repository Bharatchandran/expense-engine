const API_URL = '/api/emis';

export const fetchEmis = async () => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Failed to fetch EMIs');
    return res.json();
};

export const addEmi = async (emiData) => {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emiData)
    });
    if (!res.ok) throw new Error('Failed to add EMI');
    return res.json();
};

export const deleteEmi = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete EMI');
    return true;
};

export const payEmi = async (id) => {
    const res = await fetch(`${API_URL}/${id}/pay`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to pay EMI');
    return res.json();
};

export const payBulk = async (ids) => {
    const res = await fetch(`${API_URL}/pay-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ids)
    });
    if (!res.ok) throw new Error('Failed to pay bulk EMIs');
    return true;
};
