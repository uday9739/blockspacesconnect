import { Edit } from "@icons";
import { StyledSelectionSummary, SelectionLabel, SelectionDetails, Detail, DetailIcon, DetailCopy, EditIcon } from "./selection-summary.styles";

type Props = {
  label: string
  details: {
    icon: JSX.Element
    copy: string
  }[]
  onEdit?: () => void
}

export const SelectionSummary = ({ label, details, onEdit }: Props) => {

  return (
    <StyledSelectionSummary>
      <SelectionLabel>{label}</SelectionLabel>
      <SelectionDetails>
        {details.map(detail => (
          <Detail key={`${label}-${detail.copy}`}>
            <DetailIcon>
              {detail.icon}
            </DetailIcon>
            <DetailCopy>
              {detail.copy}
            </DetailCopy>
          </Detail>
        ))}
        { onEdit &&
          <EditIcon>
            <Edit />
          </EditIcon>
        }
      </SelectionDetails>

    </StyledSelectionSummary>

  )
}