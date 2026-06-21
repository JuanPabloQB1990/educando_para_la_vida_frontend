import { ENDPOINTS } from '../config';
import { apiPost } from '../utils/apiHelpers';

const registrationService = {
  async submit(formData: FormData): Promise<{ id: string }> {
    return apiPost<{ id: string }, FormData>(ENDPOINTS.matricula, formData);
  },
};

export default registrationService;
