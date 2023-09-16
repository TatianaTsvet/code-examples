import { cloneDeep } from 'lodash';

export function practiceUpdatePayload(practice, status?: EPracticeStatus) {
  const users = practice?.PracticeUsers?.map((user) => {
    return { practiceID: practice.id, userID: user.userID };
  });
  return {
    PracticeUsers: cloneDeep(practice.PracticeUsers),
    addressLine1: practice.addressLine1,
    addressLine2: practice.addressLine2,
    city: practice.city,
    createdAt: practice.createdAt,
    fax: practice.fax,
    id: practice.id,
    name: practice.name,
    phone: practice.phone,
    users: users,
  };
}
