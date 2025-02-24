import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminApi } from '../../services/api';
import { toast } from 'react-toastify';

const templateSchema = z.object({
  name: z.string().min(3),
  subject: z.string().min(3),
  content: z.string().min(10),
  variables: z.array(z.string())
});

type TemplateFormData = z.infer<typeof templateSchema>;

export const EmailTemplates = () => {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['email-templates'],
    queryFn: adminApi.getEmailTemplates
  });

  const { register, handleSubmit } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema)
  });

  const createMutation = useMutation({
    mutationFn: adminApi.createEmailTemplate,
    onSuccess: () => toast.success('Template created successfully')
  });

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium">Email Templates</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-md font-medium mb-4">Create Template</h3>
          <form onSubmit={handleSubmit(data => createMutation.mutate(data))}>
            <div className="space-y-4">
              <input
                {...register('name')}
                placeholder="Template Name"
                className="w-full rounded-md border-gray-300"
              />
              <input
                {...register('subject')}
                placeholder="Email Subject"
                className="w-full rounded-md border-gray-300"
              />
              <textarea
                {...register('content')}
                placeholder="Email Content"
                rows={5}
                className="w-full rounded-md border-gray-300"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-md"
              >
                Create Template
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-md font-medium mb-4">Existing Templates</h3>
          <div className="space-y-4">
            {templates?.map(template => (
              <div key={template.id} className="border p-4 rounded-md">
                <h4 className="font-medium">{template.name}</h4>
                <p className="text-sm text-gray-500">{template.subject}</p>
                <button className="text-indigo-600 text-sm mt-2">
                  Edit Template
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
