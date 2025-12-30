// import { TestBed } from '@angular/core/testing';
// import { Tab2Page } from './tab2.page';
// import { RunsService } from '../../services/runs.service';
// import { of } from 'rxjs';

// describe('Tab2Page Component Tests', () => {
//   let component: Tab2Page;
//   let mockRunsService: jasmine.SpyObj<RunsService>;
  
//   const mockRuns = [
//     {
//       id: 1,
//       created_at: '2024-12-01T08:00:00Z',
//       title: 'Morning Park Run',
//       timestamp: '2024-12-01T08:00:00Z',
//       img: 'test-image-1.jpg',
//       location: 'Central Park',
//       recurring: true,
//       recurring_info: 'Every Saturday at 8:00 AM'
//     },
//     {
//       id: 2,
//       created_at: '2024-12-02T18:30:00Z',
//       title: 'Beach Run',
//       timestamp: '2024-12-02T18:30:00Z',
//       img: 'test-image-2.jpg',
//       location: 'Santa Monica Beach',
//       recurring: false,
//       recurring_info: null
//     },
//     {
//       id: 3,
//       created_at: '2024-12-03T07:15:00Z',
//       title: 'Hill Sprint Session',
//       timestamp: '2024-12-03T07:15:00Z',
//       img: 'test-image-3.jpg',
//       location: 'Hollywood Hills',
//       recurring: false,
//       recurring_info: null
//     }
//   ];

//   beforeEach(() => {
//     const runsServiceSpy = jasmine.createSpyObj('RunsService', ['getRuns']);
    
//     TestBed.configureTestingModule({
//       imports: [Tab2Page],
//       providers: [
//         { provide: RunsService, useValue: runsServiceSpy }
//       ]
//     });

//     mockRunsService = TestBed.inject(RunsService) as jasmine.SpyObj<RunsService>;
//     mockRunsService.getRuns.and.returnValue(of(mockRuns));
    
//     const fixture = TestBed.createComponent(Tab2Page);
//     component = fixture.componentInstance;
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should initialize with default values', () => {
//     expect(component.runs).toEqual([]);
//     expect(component.filteredRuns).toEqual([]);
//     expect(component.searchQuery).toBe('');
//     expect(component.selectedFilter).toBe('all');
//     expect(component.loading).toBe(false);
//   });

//   it('should load runs on initialization', () => {
//     component.ngOnInit();
    
//     expect(mockRunsService.getRuns).toHaveBeenCalled();
//     expect(component.runs).toEqual(mockRuns);
//   });

//   it('should update search query when onSearchChange is called', () => {
//     const mockEvent = { target: { value: 'park' } };
//     spyOn(component, 'applyFilters');
    
//     component.onSearchChange(mockEvent);
    
//     expect(component.searchQuery).toBe('park');
//     expect(component.applyFilters).toHaveBeenCalled();
//   });

//   it('should update selected filter when onFilterChange is called', () => {
//     spyOn(component, 'applyFilters');
    
//     component.onFilterChange('mountains');
    
//     expect(component.selectedFilter).toBe('mountains');
//     expect(component.applyFilters).toHaveBeenCalled();
//   });

//   it('should filter runs by mountains category', () => {
//     component.runs = mockRuns;
//     component.selectedFilter = 'mountains';
//     component.searchQuery = '';
    
//     component.applyFilters();
    
//     setTimeout(() => {
//       expect(component.filteredRuns.length).toBe(1);
//       expect(component.filteredRuns[0].location).toContain('Hills');
//     }, 350);
//   });

//   it('should filter runs by romantic category', () => {
//     component.runs = mockRuns;
//     component.selectedFilter = 'romantic';
//     component.searchQuery = '';
    
//     component.applyFilters();
    
//     setTimeout(() => {
//       expect(component.filteredRuns.length).toBe(1);
//       expect(component.filteredRuns[0].location).toContain('Beach');
//     }, 350);
//   });

//   it('should filter runs by search query', () => {
//     component.runs = mockRuns;
//     component.selectedFilter = 'all';
//     component.searchQuery = 'park';
    
//     component.applyFilters();
    
//     setTimeout(() => {
//       expect(component.filteredRuns.length).toBe(1);
//       expect(component.filteredRuns[0].title.toLowerCase()).toContain('park');
//     }, 350);
//   });

//   it('should combine category filter and search query', () => {
//     component.runs = mockRuns;
//     component.selectedFilter = 'romantic';
//     component.searchQuery = 'beach';
    
//     component.applyFilters();
    
//     setTimeout(() => {
//       expect(component.filteredRuns.length).toBe(1);
//       expect(component.filteredRuns[0].location).toContain('Beach');
//     }, 350);
//   });

//   it('should return all runs when filter is all and no search query', () => {
//     component.runs = mockRuns;
//     component.selectedFilter = 'all';
//     component.searchQuery = '';
    
//     component.applyFilters();
    
//     setTimeout(() => {
//       expect(component.filteredRuns).toEqual(mockRuns);
//     }, 350);
//   });

//   it('should set loading to true during filter application', () => {
//     component.runs = mockRuns;
    
//     component.applyFilters();
    
//     expect(component.loading).toBe(true);
    
//     setTimeout(() => {
//       expect(component.loading).toBe(false);
//     }, 350);
//   });

//   it('should format date correctly', () => {
//     const timestamp = '2024-12-01T08:00:00Z';
//     const formattedDate = component.formatDate(timestamp);
    
//     expect(formattedDate).toMatch(/\w{3}, \w{3} \d{1,2}/); // Format: "Sun, Dec 1"
//   });

//   it('should format time correctly', () => {
//     const timestamp = '2024-12-01T08:00:00Z';
//     const formattedTime = component.formatTime(timestamp);
    
//     expect(formattedTime).toMatch(/\d{1,2}:\d{2} (AM|PM)/); // Format: "8:00 AM"
//   });
// });