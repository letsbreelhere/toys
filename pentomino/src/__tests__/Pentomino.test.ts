import * as Pentomino from '../Pentomino';

describe('Pentomino', () => {
  describe('ALL_BASE_POINTS', () => {
    it('does not contain duplicates', () => {
      const xPoints = Pentomino.ALL_BASE_POINTS['X'];

      expect(xPoints).toHaveLength(1);
    });
  });

  describe('placements', () => {
    it('returns all placements of a pentomino shape', () => {
      let placements = Pentomino.placements([5, 5], 'F');
      expect(placements).toContainEqual([[5, 5], [5, 6], [5, 7], [6, 5], [4, 6]]);

      expect(placements).toHaveLength(8 * 5); // 8 rotations and reflections, 5 cells

      placements = Pentomino.placements([5, 5], 'X');
      expect(placements).toContainEqual([[5, 5], [5, 6], [6, 5], [5, 4], [4, 5]]);

      expect(placements).toHaveLength(1 * 5);
    });
  });
});
