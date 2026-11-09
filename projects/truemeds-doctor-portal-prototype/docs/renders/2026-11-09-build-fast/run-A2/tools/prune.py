# Run A2: removes stale evidence before the close commit — side-by-side sheets left in compare/ from earlier step-5 passes (the
# final step-5 report has none over 1 %), the step-1 compare pictures (identical to the committed baseline), the first check bundle
# (stopped at the time limit; checks-final/ replaces it) and the serve log.
import pathlib, shutil, sys
run = pathlib.Path(sys.argv[1])
for d in ("compare", "compare-step1"):
    for p in (run / d).glob("*.png"):
        p.unlink()
shutil.rmtree(run / "checks", ignore_errors=True)
(run / "serve.log").unlink(missing_ok=True)
print(sorted(x.name for x in (run / "compare").iterdir()), sorted(x.name for x in (run / "compare-step1").iterdir()))
