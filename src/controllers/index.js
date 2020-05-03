const exems = [{
    id: 0,
    name: 'Теория вероятностей',
    link: 'lkdakl32lkj34lkn',
    date: new Date(),
    status: 'done'
}, {
    id: 1,
    name: 'Информационные системы',
    link: 'asdfsjh8923h29923b',
    date: new Date(),
    status: 'active'
}, {
    id: 2,
    name: 'Дискретная математика',
    link: '902hsoohjk2h3kjh2u',
    date: new Date(),
    status: 'active'
}];

export const exemList = (req, res) => {
    return res.json(exems);
};
