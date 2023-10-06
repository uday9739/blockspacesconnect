import { validate } from "class-validator";
import { DateTime } from "luxon";
import { PocketTokenChartFilterDto } from "./dashboard"

describe(PocketTokenChartFilterDto, () => {

  it('should be valid by default', async () => {
    const dto = new PocketTokenChartFilterDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should have a default start date 1 week before "now"', async () => {
    const expectedStart = DateTime.utc().startOf("day").minus({ weeks: 1 }).toMillis();
    const dto = new PocketTokenChartFilterDto();

    expect(dto.start).toBe(expectedStart);
  });

  it('should be invalid if start is before min', async () => {
    const dto = new PocketTokenChartFilterDto();
    dto.start = dto.minTimestamp - 1;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should be invalid if end is before start', async () => {
    const dto = new PocketTokenChartFilterDto();
    dto.start = dto.end;
    dto.end = dto.end - 1;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should be invalid if end is after max', async () => {
    const dto = new PocketTokenChartFilterDto();
    dto.end = dto.maxTimestamp + 1;

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
})