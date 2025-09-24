export type AccountType = 'LDAP' | 'Local';

export interface Label {
  text: string;
}

export interface Account {
  id: string;
  labels: Label[];
  type: AccountType;
  login: string;
  password: string | null;

  errors?: {
    labels?: boolean;
    login?: boolean;
    password?: boolean;
  };

  labelsInput?: string;
}
