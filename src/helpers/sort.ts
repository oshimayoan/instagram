type RequiredField = {
  created_at?: string;
  createdAt?: string;
};

export function sortByDate<T extends Array<RequiredField>>(
  data: T,
  order: 'asc' | 'desc',
) {
  return data.sort((a, b) => {
    let timeA = new Date(a?.created_at ?? a?.createdAt ?? '').getTime();
    let timeB = new Date(b?.created_at ?? b?.createdAt ?? '').getTime();

    let head = order === 'asc' ? -1 : 1;

    return timeA < timeB ? head : timeA > timeB ? -head : 0;
  });
}
