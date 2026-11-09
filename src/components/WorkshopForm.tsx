import { saveWorkshop } from '@/app/actions'
import type { Workshop } from '@/interface'
import { toInputDate, todayUtc } from '@/libs/dates'
import ActionForm, { SubmitButton } from './ActionForm'
import ModeFields from './ModeFields'
import { buttonPrimary, inputClass, labelClass } from './ui'

// Used for both creating (no workshop) and editing (existing workshop)
export default function WorkshopForm({ workshop }: { workshop?: Workshop }) {
  return (
    <ActionForm action={saveWorkshop} className="flex flex-col gap-5">
      {workshop && <input type="hidden" name="id" value={workshop._id} />}
      <label className={labelClass}>
        Workshop name
        <input name="name" required defaultValue={workshop?.name} placeholder="Introduction to Photography" className={inputClass} />
      </label>
      <label className={labelClass}>
        Description
        <textarea name="description" required rows={5} defaultValue={workshop?.description}
          placeholder="What will participants learn?" className={inputClass} />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Instructor
          <input name="instructor" required defaultValue={workshop?.instructor} className={inputClass} />
        </label>
        <label className={labelClass}>
          Location
          <input name="location" required defaultValue={workshop?.location} placeholder="Training room A" className={inputClass} />
        </label>
        <label className={labelClass}>
          Date
          <input type="date" name="workshopDate" required min={todayUtc()}
            defaultValue={workshop ? toInputDate(workshop.workshopDate) : undefined} className={inputClass} />
        </label>
        <label className={labelClass}>
          Capacity
          <input type="number" name="capacity" required min={1} step={1} defaultValue={workshop?.capacity ?? 20} className={inputClass} />
        </label>
      </div>
      <ModeFields
        defaultMode={workshop?.registrationMode ?? 'fcfs'}
        defaultCloseDate={workshop?.lotteryCloseDate ? toInputDate(workshop.lotteryCloseDate) : undefined}
        minCloseDate={todayUtc()}
        modeLocked={!!workshop && ((workshop.confirmedCount ?? 0) + (workshop.pendingCount ?? 0) > 0 || !!workshop.lotteryDrawnAt)}
        closeDateLocked={!!workshop?.lotteryDrawnAt}
      />
      <SubmitButton className={`${buttonPrimary} self-start`} pendingText="Saving…">
        {workshop ? 'Save changes' : 'Publish workshop'}
      </SubmitButton>
    </ActionForm>
  )
}
