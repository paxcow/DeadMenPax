type CellState = "empty" | "filled";

interface Position {
  x: number;
  y: number;
}

interface GridCell extends Position {
  state: CellState;
  element: HTMLDivElement;
}

class Ship {
  // Keep a Map of all cells (empty or filled)
  private cells: Map<string, GridCell> = new Map();

  // Track the bounding box of all cells (empty or filled)
  private minX = 0;
  private maxX = 0;
  private minY = 0;
  private maxY = 0;

  //UI parameters
  private gridContainer: HTMLElement;
  private scrollMap: ScrollmapWithZoomNS.ScrollmapWithZoom;

  //state
  private positioning: boolean = false;

  constructor(private game: DeadMenPax) {}

  public init() {
    //add the wrapper for the scrollmap
    let targetDiv = document.querySelector("#game_play_area");
    let seaDiv = document.createElement("div");
    let id = "sea_wrapper";
    seaDiv.id = id;
    targetDiv.insertBefore(seaDiv, targetDiv.firstChild);

    //setup the scrollmap
    this.setupScrollMap("sea_wrapper");

    //prepare the grid in the oversurface

    let oversurface = document.querySelector<HTMLDivElement>(
      ".scrollmap_onsurface"
    );
    this.initGrid(oversurface);
  }

  private setupScrollMap(seaWrapper: string) {
    this.scrollMap = new ebg.scrollmapWithZoom();
    this.scrollMap.zoom = 0.8;

    //create main scrollmap
    this.scrollMap.createCompletely($(seaWrapper));
  }

  private initGrid(oversurface: HTMLElement): void {
    let container = document.createElement("div");
    container.id = "grid_container";

    // Just some base styling for visualization.
    container.style.position = "relative";
    container.style.display = "grid";
    container.style.border = "1px solid #333";
    //add the grid container
    this.gridContainer = container;
    oversurface.appendChild(container);

    //add the first empty element at 0,0
    this.createCell(0, 0);
    this.updateGrid();
  }

  public fillCell(x: number, y: number, child?: HTMLElement): void {
    if (y < 0) {
      console.warn(`Cannot fill a cell with negative Y: (x=${x}, y=${y})`);
      return;
    }
    const key = this.cellKey(x, y);
    const cell = this.cells.get(key);

    if (!cell) {
      console.warn(`Cannot fill (x=${x}, y=${y}) because it doesn't exist. 
                     You can only fill cells that were previously empty.`);
      return;
    }
    if (cell.state === "filled") {
      console.warn(`Cell (x=${x}, y=${y}) is already filled.`);
      return;
    }

    // Fill the cell
    cell.state = "filled";
    cell.element.innerHTML = "";
    if (child) {
      cell.element.appendChild(child);
    } else {
      cell.element.textContent = `(${x}, ${y})`;
    }

    // Update grid => ensures the newly filled cell has empty neighbors
    this.updateGrid();
  }

  /**
   * Internal helper to generate a stable string key for each (x, y).
   */
  private cellKey(x: number, y: number): string {
    return `${x}:${y}`;
  }

  /**
   * Create the underlying DOM <div> for a cell.
   */
  private createCell(
    x: number,
    y: number,
    state: CellState = "empty"
  ): GridCell {
    const key = this.cellKey(x, y);
    const div = document.createElement("div");
    div.id = `cell_${key}`;
    div.style.border = "1px solid black";
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";

    // Minimal placeholders:
    div.dataset.x = x.toString();
    div.dataset.y = y.toString();

    const cell: GridCell = { x, y, state, element: div };
    this.cells.set(key, cell);

    // Append to container so it physically exists
    this.gridContainer.appendChild(div);

    return cell;
  }

  private updateGrid(): void {
    // For each filled cell, ensure neighbors exist (unless y=0 blocks below).
    this.cells.forEach((cell) => {
      if (cell.state === "filled") {
        this.growFromCell(cell.x, cell.y);
      }
    });

    //    Recompute bounding box from all existing cells
    //    (We do this in one pass so we only expand as needed.)
    this.recomputeBoundingBox();

    // Set up the CSS grid to cover minX..maxX, minY..maxY
    //    The # of columns/rows is (max-min+1).
    const totalCols = this.maxX - this.minX + 1;
    const totalRows = this.maxY - this.minY + 1;

    this.gridContainer.style.gridTemplateColumns = `repeat(${totalCols}, 50px)`;
    this.gridContainer.style.gridTemplateRows = `repeat(${totalRows}, 50px)`;

    // Position each cell
    this.cells.forEach((cell) => {
      const colPos = cell.x - this.minX + 1; // 1-based from the left
      // Invert Y: row 1 is maxY, row totalRows is minY
      const rowPos = this.maxY - cell.y + 1;
      cell.element.style.gridColumn = String(colPos);
      cell.element.style.gridRow = String(rowPos);
    });
  }
  private growFromCell(x: number, y: number): void {
    // Left neighbor => (x-1, y) if not present
    this.growInDirection(x - 1, y);

    // Right neighbor => (x+1, y)
    this.growInDirection(x + 1, y);

    // Above => (x, y+1)
    this.growInDirection(x, y + 1);

    // Below => (x, y-1), but only if y-1 >= 0
    if (y - 1 >= 0) {
      this.growInDirection(x, y - 1);
    }
  }

  private growInDirection(x: number, y: number): void {
    if (y < 0) return; // skip any row below y=0

    const key = this.cellKey(x, y);
    if (!this.cells.has(key)) {
      this.createCell(x, y);
    }
  }

  private recomputeBoundingBox(): void {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    this.cells.forEach((cell) => {
      if (cell.x < minX) minX = cell.x;
      if (cell.x > maxX) maxX = cell.x;
      if (cell.y < minY) minY = cell.y;
      if (cell.y > maxY) maxY = cell.y;
    });

    // If we somehow have no cells, leave bounding box alone
    if (this.cells.size === 0) {
      return;
    }

    this.minX = minX;
    this.maxX = maxX;
    this.minY = Math.max(minY, 0); // clamp to 0
    this.maxY = maxY;
  }

  public toggleHighlight(
    positions: Position | Position[],
    state: boolean | null = null
  ): void {
    // Ensure positions is always an array
    const positionsArray = Array.isArray(positions) ? positions : [positions];

    for (const pos of positionsArray) {
      // Create the key to check in the Map
      const key = this.cellKey(pos.x, pos.y);

      if (this.cells.has(key)) {
        const cell = this.cells.get(key)!;

        if (state === true) {
          cell.element.classList.add("highlighted");
        } else if (state === false) {
          cell.element.classList.remove("highlighted");
        } else {
          // Toggle class if state is null
          cell.element.classList.toggle("highlighted");
        }
      }
    }
  }

  public clearHighlight(): void {
    this.cells.forEach((value, key) => {
      let cell = this.cells.get(key)!;
      cell.element.classList.remove("highlighted");
    });
  }

}
