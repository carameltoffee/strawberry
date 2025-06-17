interface ILoginReq {
     username: string,
     password: string,
}

interface IRegisterReq {
     full_name: string,
     email: string,
     specialization?: string,
     code: string,
     username: string,
     password: string,
}

interface IReviewInput {
     comment: string;
     master_id: number;
     rating: number;
}

interface IAppointmentInput {
     master_id: number;
     time: string; 
}

interface IAppointments {
     master_appointments: IAppointment[],
     user_appointments: IAppointment[],
}