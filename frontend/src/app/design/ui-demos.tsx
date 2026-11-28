'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Pagination } from '@/components/ui/pagination';
import { TabPanel, Tabs } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export function UiDemos() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState('applications');

  return (
    <>
      <section aria-labelledby="modal-demo">
        <h2 id="modal-demo" className="mb-3 text-xl font-semibold">Modal and toasts</h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setOpen(true)}>Open modal</Button>
          <Button variant="secondary" onClick={() => toast.success('Application sent')}>
            Success toast
          </Button>
          <Button variant="secondary" onClick={() => toast.error('Could not save your changes')}>
            Error toast
          </Button>
          <Button variant="secondary" onClick={() => toast('Just so you know', { description: 'A neutral message.' })}>
            Neutral toast
          </Button>
        </div>

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Apply to Student Teammate Finder"
          description="Tell the lead why you would be a good fit. This is optional."
        >
          <Textarea label="Message" placeholder="I have used Node.js and ..." autoFocus />
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success('Application sent');
                setOpen(false);
              }}
            >
              Send application
            </Button>
          </div>
        </Modal>
      </section>

      <section aria-labelledby="pagination-demo">
        <h2 id="pagination-demo" className="mb-3 text-xl font-semibold">Pagination</h2>
        <Pagination page={page} limit={20} total={95} onPageChange={setPage} />
      </section>

      <section aria-labelledby="tabs-demo">
        <h2 id="tabs-demo" className="mb-3 text-xl font-semibold">Tabs</h2>
        <Tabs
          value={tab}
          onValueChange={setTab}
          items={[
            { value: 'applications', label: 'Applications', count: 3 },
            { value: 'invitations', label: 'Invitations', count: 1 },
            { value: 'team', label: 'Team', count: 2 },
            { value: 'settings', label: 'Settings' },
          ]}
        >
          <TabPanel value="applications">Pending applications appear here.</TabPanel>
          <TabPanel value="invitations">Invitations you sent appear here.</TabPanel>
          <TabPanel value="team">The team roster appears here.</TabPanel>
          <TabPanel value="settings">Project settings appear here.</TabPanel>
        </Tabs>
      </section>
    </>
  );
}
